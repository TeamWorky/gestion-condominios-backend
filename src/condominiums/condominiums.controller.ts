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
import { CondominiumsService } from './condominiums.service';
import { CreateCondominiumDto } from './dto/create-condominium.dto';
import { UpdateCondominiumDto } from './dto/update-condominium.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ResponseUtil } from '../utils/response.util';
import { SUCCESS_MESSAGES } from '../common/constants/app.constants';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { MinRoleGuard } from '../guards/min-role.guard';
import { MinRole } from '../common/decorators/min-role.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Condominiums')
@ApiBearerAuth('JWT-auth')
@Controller('condominiums')
@UseGuards(JwtAuthGuard, MinRoleGuard)
export class CondominiumsController {
  constructor(private readonly condominiumsService: CondominiumsService) {}

  @Post()
  @Version('1')
  @MinRole(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new condominium (SUPER_ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Condominium created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - SUPER_ADMIN role required' })
  async create(@Body() createCondominiumDto: CreateCondominiumDto) {
    const condominium = await this.condominiumsService.create(createCondominiumDto);
    return ResponseUtil.success(condominium, SUCCESS_MESSAGES.CREATED);
  }

  @Get()
  @Version('1')
  @MinRole(Role.USER)
  @ApiOperation({ summary: 'Get all condominiums with pagination (USER+)' })
  @ApiResponse({ status: 200, description: 'Condominiums retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() pagination: PaginationDto) {
    const { data, total } = await this.condominiumsService.findAll(pagination);
    return ResponseUtil.paginated(data, pagination.page || 1, pagination.limit || 10, total);
  }

  @Get(':id')
  @Version('1')
  @MinRole(Role.USER)
  @ApiOperation({ summary: 'Get condominium by ID (USER+)' })
  @ApiResponse({ status: 200, description: 'Condominium retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Condominium not found' })
  async findOne(@Param('id') id: string) {
    const condominium = await this.condominiumsService.findOne(id);
    return ResponseUtil.success(condominium);
  }

  @Patch(':id')
  @Version('1')
  @MinRole(Role.ADMIN)
  @ApiOperation({ summary: 'Update condominium by ID (ADMIN+)' })
  @ApiResponse({ status: 200, description: 'Condominium updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - ADMIN role required' })
  @ApiResponse({ status: 404, description: 'Condominium not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCondominiumDto: UpdateCondominiumDto,
  ) {
    const condominium = await this.condominiumsService.update(id, updateCondominiumDto);
    return ResponseUtil.success(condominium, SUCCESS_MESSAGES.UPDATED);
  }

  @Delete(':id')
  @Version('1')
  @MinRole(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete condominium by ID (SUPER_ADMIN only)' })
  @ApiResponse({ status: 204, description: 'Condominium soft deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - SUPER_ADMIN role required' })
  @ApiResponse({ status: 404, description: 'Condominium not found' })
  async remove(@Param('id') id: string) {
    await this.condominiumsService.remove(id);
  }

  @Patch(':id/restore')
  @Version('1')
  @MinRole(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Restore a soft deleted condominium (SUPER_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Condominium restored successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - SUPER_ADMIN role required' })
  @ApiResponse({ status: 404, description: 'Condominium not found or not deleted' })
  async restore(@Param('id') id: string) {
    const condominium = await this.condominiumsService.restore(id);
    return ResponseUtil.success(condominium, 'Condominium restored successfully');
  }
}
