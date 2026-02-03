import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ResponseUtil } from '../utils/response.util';
import { SUCCESS_MESSAGES } from '../common/constants/app.constants';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { MinRoleGuard } from '../guards/min-role.guard';
import { MinRole } from '../common/decorators/min-role.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Units')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(JwtAuthGuard, MinRoleGuard)
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post('buildings/:buildingId/units')
  @Version('1')
  @MinRole(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new unit in a building (ADMIN+)' })
  @ApiResponse({ status: 201, description: 'Unit created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - ADMIN role required' })
  @ApiResponse({ status: 404, description: 'Building not found' })
  @ApiResponse({ status: 409, description: 'Unit number already exists in this building' })
  async create(
    @Param('buildingId') buildingId: string,
    @Body() createUnitDto: Omit<CreateUnitDto, 'buildingId'>,
  ) {
    const unit = await this.unitsService.create({
      ...createUnitDto,
      buildingId,
    } as CreateUnitDto);
    return ResponseUtil.success(unit, SUCCESS_MESSAGES.CREATED);
  }

  @Get('buildings/:buildingId/units')
  @Version('1')
  @MinRole(Role.USER)
  @ApiOperation({ summary: 'Get all units in a building (USER+)' })
  @ApiResponse({ status: 200, description: 'Units retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Building not found' })
  async findAllByBuilding(
    @Param('buildingId') buildingId: string,
    @Query() pagination: PaginationDto,
  ) {
    const { data, total } = await this.unitsService.findAllByBuilding(buildingId, pagination);
    return ResponseUtil.paginated(data, pagination.page || 1, pagination.limit || 10, total);
  }

  @Get('units/:id')
  @Version('1')
  @MinRole(Role.USER)
  @ApiOperation({ summary: 'Get unit by ID (USER+)' })
  @ApiResponse({ status: 200, description: 'Unit retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  async findOne(@Param('id') id: string) {
    const unit = await this.unitsService.findOne(id);
    return ResponseUtil.success(unit);
  }

  @Patch('units/:id')
  @Version('1')
  @MinRole(Role.ADMIN)
  @ApiOperation({ summary: 'Update unit by ID (ADMIN+)' })
  @ApiResponse({ status: 200, description: 'Unit updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - ADMIN role required' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  @ApiResponse({ status: 409, description: 'Unit number already exists in this building' })
  async update(
    @Param('id') id: string,
    @Body() updateUnitDto: UpdateUnitDto,
  ) {
    const unit = await this.unitsService.update(id, updateUnitDto);
    return ResponseUtil.success(unit, SUCCESS_MESSAGES.UPDATED);
  }

  @Delete('units/:id')
  @Version('1')
  @MinRole(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete unit by ID (ADMIN+)' })
  @ApiResponse({ status: 204, description: 'Unit soft deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - ADMIN role required' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  async remove(@Param('id') id: string) {
    await this.unitsService.remove(id);
  }
}
