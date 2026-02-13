import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check for database and Redis' })
  @ApiOkResponse({
    schema: {
      example: {
        status: 'ok',
        checks: { db: 'up', redis: 'up' },
        durationMs: 12,
        timestamp: '2026-02-13T00:00:00.000Z',
      },
    },
  })
  getHealth() {
    return this.healthService.getHealth();
  }
}
