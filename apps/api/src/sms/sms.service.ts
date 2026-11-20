import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

const SMS_API_URL =
  'http://login4.spearuc.com/MOBILE_APPS_API/sms_api.php';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  private readonly authKey: string;
  private readonly sender: string;
  private readonly templateId: string;

  constructor(private readonly config: ConfigService) {
    this.authKey = this.config.get<string>('SMS_AUTH_KEY') ?? '';
    this.sender = this.config.get<string>('SMS_SENDER_ID') ?? '';
    this.templateId = this.config.get<string>('SMS_TEMPLATE_ID') ?? '';
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<boolean> {
    const smsText = `Dear Customer ${otp} is your OTP for https://akkukachasma.com/signup verification. Please do not share your OTP - Akku ka chasma`;

    try {
      const response = await axios.get(SMS_API_URL, {
        params: {
          type: 'smsquicksend',
          authKey: this.authKey,
          sender: this.sender,
          to_mobileno: phoneNumber,
          sms_text: smsText,
          t_id: this.templateId,
        },
      });

      this.logger.log(
        `OTP SMS sent to ${phoneNumber} | Response: ${JSON.stringify(response.data)}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send OTP SMS to ${phoneNumber}`,
        error instanceof Error ? error.stack : error,
      );
      return false;
    }
  }
}
