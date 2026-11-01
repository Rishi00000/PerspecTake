import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { ContextModule } from './modules/context/context.module.js';
import { OriginalityModule } from './modules/originality/originality.module.js';
import { SystemHealthCheck } from './health/system.health.js';

@McpApp({
  module: AppModule,
  server: {
    name: 'perspectake',
    version: '1.0.0'
  },
  logging: {
    level: 'info'
  }
})
@Module({
  name: 'app',
  description: 'PerspecTake LinkedIn originality coach',
  imports: [
    ConfigModule.forRoot(),
    ContextModule,
    OriginalityModule
  ],
  providers: [
    SystemHealthCheck,
  ]
})
export class AppModule {}
