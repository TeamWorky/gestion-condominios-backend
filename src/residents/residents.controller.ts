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
import { ResidentsService } from './residents.service';
import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ResponseUtil } from '../utils/response.util';
import { SUCCESS_MESSAGES } from '../common/constants/app.constants';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { MinRoleGuard } from '../guards/min-role.guard';
import { MinRole } from '../common/decorators/min-role.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Residents')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(JwtAuthGuard, MinRoleGuard)
export class ResidentsController {
  constructor(private readonly residentsService: ResidentsService) {}

  @Post('units/:unitId/residents')
  @Version('1')
  @MinRole(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new resident in a unit (ADMIN+)' })
  @ApiResponse({ status: 201, description: 'Resident created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - ADMIN role required' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  async create(
    @Param('unitId') unitId: string,
    @Body() createResidentDto: Omit<CreateResidentDto, 'unitId'>,
  ) {
    const resident = await this.residentsService.create({
      ...createResidentDto,
      unitId,
    } as CreateResidentDto);
    return ResponseUtil.success(resident, SUCCESS_MESSAGES.CREATED);
  }

  @Get('units/:unitId/residents')
  @Version('1')
  @MinRole(Role.USER)
  @ApiOperation({ summary: 'Get all residents in a unit (USER+)' })
  @ApiResponse({ status: 200, description: 'Residents retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  async findAllByUnit(
    @Param('unitId') unitId: string,
    @Query() pagination: PaginationDto,
  ) {
    const { data, total } = await this.residentsService.findAllByUnit(unitId, pagination);
    return ResponseUtil.paginated(data, pagination.page || 1, pagination.limit || 10, total);
  }

  @Get('residents/:id')
  @Version('1')
  @MinRole(Role.USER)
  @ApiOperation({ summary: 'Get resident by ID (USER+)' })
  @ApiResponse({ status: 200, description: 'Resident retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Resident not found' })
  async findOne(@Param('id') id: string) {
    const resident = await this.residentsService.findOne(id);
    return ResponseUtil.success(resident);
  }

  @Patch('residents/:id')
  @Version('1')
  @MinRole(Role.ADMIN)
  @ApiOperation({ summary: 'Update resident by ID (ADMIN+)' })
  @ApiResponse({ status: 200, description: 'Resident updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - ADMIN role required' })
  @ApiResponse({ status: 404, description: 'Resident not found' })
  async update(
    @Param('id') id: string,
    @Body() updateResidentDto: UpdateResidentDto,
  ) {
    const resident = await this.residentsService.update(id, updateResidentDto);
    return ResponseUtil.success(resident, SUCCESS_MESSAGES.UPDATED);
  }

  @Delete('residents/:id')
  @Version('1')
  @MinRole(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete resident by ID (ADMIN+)' })
  @ApiResponse({ status: 204, description: 'Resident soft deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - ADMIN role required' })
  @ApiResponse({ status: 404, description: 'Resident not found' })
  async remove(@Param('id') id: string) {
    await this.residentsService.remove(id);
  }
}
