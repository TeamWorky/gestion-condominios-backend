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
import { BuildingsService } from './buildings.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ResponseUtil } from '../utils/response.util';
import { SUCCESS_MESSAGES } from '../common/constants/app.constants';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { MinRoleGuard } from '../guards/min-role.guard';
import { MinRole } from '../common/decorators/min-role.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Buildings')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(JwtAuthGuard, MinRoleGuard)
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Post('condominiums/:condoId/buildings')
  @Version('1')
  @MinRole(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new building in a condominium (ADMIN+)' })
  @ApiResponse({ status: 201, description: 'Building created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - ADMIN role required' })
  @ApiResponse({ status: 404, description: 'Condominium not found' })
  @ApiResponse({ status: 409, description: 'Building code already exists in this condominium' })
  async create(
    @Param('condoId') condoId: string,
    @Body() createBuildingDto: Omit<CreateBuildingDto, 'condominiumId'>,
  ) {
    const building = await this.buildingsService.create({
      ...createBuildingDto,
      condominiumId: condoId,
    } as CreateBuildingDto);
    return ResponseUtil.success(building, SUCCESS_MESSAGES.CREATED);
  }

  @Get('condominiums/:condoId/buildings')
  @Version('1')
  @MinRole(Role.USER)
  @ApiOperation({ summary: 'Get all buildings in a condominium (USER+)' })
  @ApiResponse({ status: 200, description: 'Buildings retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Condominium not found' })
  async findAllByCondominium(
    @Param('condoId') condoId: string,
    @Query() pagination: PaginationDto,
  ) {
    const { data, total } = await this.buildingsService.findAllByCondominium(condoId, pagination);
    return ResponseUtil.paginated(data, pagination.page || 1, pagination.limit || 10, total);
  }

  @Get('buildings/:id')
  @Version('1')
  @MinRole(Role.USER)
  @ApiOperation({ summary: 'Get building by ID (USER+)' })
  @ApiResponse({ status: 200, description: 'Building retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Building not found' })
  async findOne(@Param('id') id: string) {
    const building = await this.buildingsService.findOne(id);
    return ResponseUtil.success(building);
  }

  @Patch('buildings/:id')
  @Version('1')
  @MinRole(Role.ADMIN)
  @ApiOperation({ summary: 'Update building by ID (ADMIN+)' })
  @ApiResponse({ status: 200, description: 'Building updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - ADMIN role required' })
  @ApiResponse({ status: 404, description: 'Building not found' })
  @ApiResponse({ status: 409, description: 'Building code already exists in this condominium' })
  async update(
    @Param('id') id: string,
    @Body() updateBuildingDto: UpdateBuildingDto,
  ) {
    const building = await this.buildingsService.update(id, updateBuildingDto);
    return ResponseUtil.success(building, SUCCESS_MESSAGES.UPDATED);
  }

  @Delete('buildings/:id')
  @Version('1')
  @MinRole(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete building by ID (ADMIN+)' })
  @ApiResponse({ status: 204, description: 'Building soft deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - ADMIN role required' })
  @ApiResponse({ status: 404, description: 'Building not found' })
  async remove(@Param('id') id: string) {
    await this.buildingsService.remove(id);
  }
}
