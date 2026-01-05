import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { FilterLogsDto, LogLevel } from './dto/filter-logs.dto';
import { ResponseUtil } from '../utils/response.util';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { MinRoleGuard } from '../guards/min-role.guard';
import { MinRole } from '../common/decorators/min-role.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Logs')
@ApiBearerAuth('JWT-auth')
@Controller('logs')
@UseGuards(JwtAuthGuard, MinRoleGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @Version('1')
  @MinRole(Role.ADMIN)
  @ApiOperation({ 
    summary: 'Get all logs with filters (Admin+)',
    description: 'Retrieve logs with pagination and optional filters by level, context, requestId, or search term'
  })
  @ApiResponse({ status: 200, description: 'Logs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async findAll(@Query() filterDto: FilterLogsDto) {
    const { data, total } = await this.logsService.findAll(filterDto);
    return ResponseUtil.paginated(
      data,
      filterDto.page || 1,
      filterDto.limit || 10,
      total,
    );
  }

  @Get('stats')
  @Version('1')
  @MinRole(Role.ADMIN)
  @ApiOperation({ 
    summary: 'Get log statistics (Admin+)',
    description: 'Get statistics about logs: total count, count by level, and count by context'
  })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getStats() {
    const stats = await this.logsService.getStats();
    return ResponseUtil.success(stats);
  }

  @Get('contexts')
  @Version('1')
  @MinRole(Role.ADMIN)
  @ApiOperation({ 
    summary: 'Get all available contexts (Admin+)',
    description: 'Get list of all unique contexts in the logs'
  })
  @ApiResponse({ status: 200, description: 'Contexts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getContexts() {
    const contexts = await this.logsService.getContexts();
    return ResponseUtil.success(contexts);
  }

  @Get(':id')
  @Version('1')
  @MinRole(Role.ADMIN)
  @ApiOperation({ summary: 'Get log by ID (Admin+)' })
  @ApiParam({ name: 'id', description: 'Log ID', example: 'uuid-here' })
  @ApiResponse({ status: 200, description: 'Log retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Log not found' })
  async findOne(@Param('id') id: string) {
    const log = await this.logsService.findOne(id);
    return ResponseUtil.success(log);
  }

  @Get('request/:requestId')
  @Version('1')
  @MinRole(Role.ADMIN)
  @ApiOperation({ 
    summary: 'Get logs by request ID (Admin+)',
    description: 'Get all logs associated with a specific request ID'
  })
  @ApiParam({ name: 'requestId', description: 'Request ID', example: 'req-123' })
  @ApiResponse({ status: 200, description: 'Logs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async findByRequestId(@Param('requestId') requestId: string) {
    const logs = await this.logsService.findByRequestId(requestId);
    return ResponseUtil.success(logs);
  }

  @Get('level/:level')
  @Version('1')
  @MinRole(Role.ADMIN)
  @ApiOperation({ 
    summary: 'Get logs by level (Admin+)',
    description: 'Get logs filtered by level (error, warn, info, debug, verbose)'
  })
  @ApiParam({ 
    name: 'level', 
    description: 'Log level', 
    enum: LogLevel,
    example: LogLevel.ERROR 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Maximum number of logs to return',
    example: 100
  })
  @ApiResponse({ status: 200, description: 'Logs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async findByLevel(
    @Param('level') level: LogLevel,
    @Query('limit') limit?: number,
  ) {
    const logs = await this.logsService.findByLevel(level, limit);
    return ResponseUtil.success(logs);
  }
}
