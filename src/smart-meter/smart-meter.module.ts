import { Module } from '@nestjs/common';
import { SmartMeterService } from './smart-meter.service';

@Module({
  providers: [SmartMeterService],
  exports: [SmartMeterService], // Export the service to be used in other modules

})
export class SmartMeterModule {}
