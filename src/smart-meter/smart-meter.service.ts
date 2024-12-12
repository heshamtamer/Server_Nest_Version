import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SmartMeterService implements OnModuleInit {
  private jwtToken: string = '';
  private tokenExpiry: Date;

  async onModuleInit() {
    await this.fetchAndStoreToken();
    this.scheduleTokenRefresh();
  }

  private async fetchAndStoreToken(): Promise<void> {
    try {
      const response = await axios.get(`${process.env.SMART_METER_BASE_URL}/api/token`, {
        headers: {
          Accept: 'application/json',
          'X-API-KEY': process.env.SMART_METER_API_KEY,
        },
      });

      if (response.status === 200 && response.data?.data?.jwt) {
        this.jwtToken = response.data.data.jwt;
        this.tokenExpiry = new Date(Date.now() + 19 * 60 * 1000); // Set expiry to 19 minutes from now
        console.log('Smart Meter token fetched:', this.jwtToken);
      } else {
        console.error('Failed to fetch Smart Meter token:', response.data);
      }
    } catch (error) {

      console.error('Error fetching Smart Meter token:', error.message);
      if (error.response) {
        console.error('Response from Smart Meter API:', error.response.data);
        console.error('Status code:', error.response.status);
    }
  }
}

  private scheduleTokenRefresh() {
    if (this.tokenExpiry) {
      const refreshInterval = this.tokenExpiry.getTime() - Date.now() - 60 * 1000; // Refresh 1 minute before expiry
      setTimeout(async () => {
        await this.fetchAndStoreToken();
        this.scheduleTokenRefresh(); // Re-schedule the refresh for the new token
      }, Math.max(refreshInterval, 0)); // Ensure non-negative interval
    }
  }

  // Ensure the token is valid and fetch a new one if expired
  public async getToken(): Promise<string> {
    if (!this.jwtToken || new Date() >= this.tokenExpiry) {
      await this.fetchAndStoreToken(); // Refresh token if expired or not present
    }
    return this.jwtToken;
  }
}
