# 🔗 Guía de Integraciones

## Airbnb API

### Sincronización de Reservas

Aunque Airbnb tiene limitaciones en su API pública, existen varias opciones:

#### Opción 1: API Official de Airbnb (Recomendada si tienes acceso)
```bash
# Instalar SDK
npm install airbnb
```

**Implementación:**
```typescript
// src/modules/integrations/airbnb/airbnb.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AirbnbService {
  private apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get('AIRBNB_API_KEY');
  }

  async syncReservations(propertyId: string) {
    // Obtener reservas de Airbnb
    // Sincronizar con BD local
    // Actualizar disponibilidad
  }

  async updateListing(propertyId: string, data: any) {
    // Actualizar información del listado
  }
}
```

#### Opción 2: Web Scraping (Temporal/MVP)
```typescript
// src/modules/integrations/airbnb/airbnb-scraper.service.ts
import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import axios from 'axios';

@Injectable()
export class AirbnbScraperService {
  async getReservations(propertyUrl: string) {
    try {
      const response = await axios.get(propertyUrl);
      const $ = cheerio.load(response.data);
      // Parsear datos
      return this.parseReservations($);
    } catch (error) {
      throw new Error('Failed to scrape Airbnb data');
    }
  }

  private parseReservations($: any) {
    const reservations = [];
    // Lógica de parseo
    return reservations;
  }
}
```

#### Opción 3: Manual CSV Import (MVP Simple)
```typescript
// src/modules/integrations/airbnb/airbnb-import.service.ts
import { Injectable } from '@nestjs/common';
import * as csv from 'csv-parser';

@Injectable()
export class AirbnbImportService {
  async importFromCSV(filePath: string) {
    const reservations = [];
    
    return new Promise((resolve, reject) => {
      require('fs')
        .createReadStream(filePath)
        .pipe(csv())
        .on('data', (row: any) => {
          reservations.push({
            guestName: row.guest_name,
            checkIn: new Date(row.check_in),
            checkOut: new Date(row.check_out),
            totalPrice: parseFloat(row.total_price),
          });
        })
        .on('end', () => resolve(reservations))
        .on('error', reject);
    });
  }
}
```

### Configuración Inicial
```env
AIRBNB_API_KEY=your-api-key
AIRBNB_API_SECRET=your-secret
AIRBNB_SYNC_INTERVAL=3600000  # 1 hora
```

---

## Integración de Pagos

### Stripe Connect

Para transferencias automáticas a propietarios:

```bash
npm install stripe
```

**Setup:**
```typescript
// src/modules/integrations/stripe/stripe.service.ts
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createConnectedAccount(email: string, name: string) {
    const account = await this.stripe.accounts.create({
      type: 'express',
      email,
      business_profile: {
        name,
        support_email: email,
      },
    });

    return {
      accountId: account.id,
      onboardingLink: await this.getOnboardingLink(account.id),
    };
  }

  async transferToOwner(accountId: string, amount: number, reason: string) {
    const transfer = await this.stripe.transfers.create({
      amount: Math.round(amount * 100), // Convertir a centavos
      currency: 'usd',
      destination: accountId,
      description: reason,
    });

    return transfer;
  }

  async getOnboardingLink(accountId: string) {
    const link = await this.stripe.accountLinks.create({
      account: accountId,
      type: 'account_onboarding',
      refresh_url: `${process.env.APP_URL}/setup/stripe/refresh`,
      return_url: `${process.env.APP_URL}/setup/stripe/complete`,
    });

    return link.url;
  }
}
```

**Controlador:**
```typescript
@Post('stripe/create-account')
async createStripeAccount(@Body() dto: CreateStripeAccountDto) {
  const result = await this.stripeService.createConnectedAccount(
    dto.email,
    dto.name
  );
  
  // Guardar accountId en usuario
  await this.usersService.updateStripeAccount(dto.userId, result.accountId);

  return result;
}

@Post('stripe/transfer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
async transferFunds(@Body() dto: TransferDto) {
  return this.stripeService.transferToOwner(
    dto.stripeAccountId,
    dto.amount,
    dto.reason
  );
}
```

### Variables de Entorno
```env
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
APP_URL=https://app.example.com
```

### Webhooks de Stripe
```typescript
// src/modules/integrations/stripe/stripe-webhook.controller.ts
import { Controller, Post, RawBodyRequest, Req } from '@nestjs/common';
import Stripe from 'stripe';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(
    private stripeService: StripeService,
    private configService: ConfigService
  ) {}

  @Post()
  async handleWebhook(@Req() req: RawBodyRequest<Buffer>) {
    const sig = req.headers['stripe-signature'] as string;
    const secret = this.configService.get('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;

    try {
      event = Stripe.webhooks.constructEvent(req.rawBody, sig, secret);
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'account.updated':
        await this.handleAccountUpdated(event.data.object as Stripe.Account);
        break;
      case 'transfer.created':
        await this.handleTransferCreated(event.data.object as Stripe.Transfer);
        break;
      // ... más eventos
    }

    return { received: true };
  }

  private async handleAccountUpdated(account: Stripe.Account) {
    // Actualizar estado de cuenta del propietario
  }

  private async handleTransferCreated(transfer: Stripe.Transfer) {
    // Registrar transferencia en BD
  }
}
```

---

## Email (SendGrid/Gmail)

```bash
npm install @sendgrid/mail
```

```typescript
// src/modules/integrations/email/email.service.ts
import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY'));
  }

  async sendOwnerStatement(email: string, statement: OwnerStatement) {
    const msg = {
      to: email,
      from: 'noreply@apartamentos.com',
      subject: `Estado de Cuenta - ${statement.period}`,
      template_id: 'd-owner-statement',
      dynamic_template_data: {
        period: statement.period,
        totalIncome: statement.totalIncome,
        totalExpenses: statement.totalExpenses,
        netGain: statement.netGain,
        adminCommission: statement.adminCommission,
        finalPayment: statement.finalPayment,
      },
    };

    return sgMail.send(msg);
  }

  async sendReservationConfirmation(email: string, reservation: Reservation) {
    const msg = {
      to: email,
      from: 'noreply@apartamentos.com',
      subject: 'Reserva Confirmada',
      template_id: 'd-reservation-confirmation',
      dynamic_template_data: {
        guestName: reservation.guestName,
        propertyName: reservation.property.name,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        totalPrice: reservation.totalPrice,
      },
    };

    return sgMail.send(msg);
  }
}
```

---

## SMS (Twilio)

```bash
npm install twilio
```

```typescript
// src/modules/integrations/sms/sms.service.ts
import { Injectable } from '@nestjs/common';
import twilio from 'twilio';

@Injectable()
export class SmsService {
  private client: twilio.Twilio;

  constructor(private configService: ConfigService) {
    this.client = twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN')
    );
  }

  async sendCheckInReminder(phoneNumber: string, reservation: Reservation) {
    await this.client.messages.create({
      body: `Recordatorio: Tu reserva en ${reservation.property.name} es mañana a las 15:00. Código de acceso: ${reservation.accessCode}`,
      from: this.configService.get('TWILIO_PHONE_NUMBER'),
      to: phoneNumber,
    });
  }

  async sendOwnerAlert(phoneNumber: string, property: Property, message: string) {
    await this.client.messages.create({
      body: `Alerta en ${property.name}: ${message}`,
      from: this.configService.get('TWILIO_PHONE_NUMBER'),
      to: phoneNumber,
    });
  }
}
```

---

## Almacenamiento en la Nube (AWS S3)

```bash
npm install aws-sdk
```

```typescript
// src/modules/integrations/storage/s3.service.ts
import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3Service {
  private s3: AWS.S3;

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
  }

  async uploadPropertyPhoto(file: Express.Multer.File, propertyId: string) {
    const key = `properties/${propertyId}/${Date.now()}-${file.originalname}`;

    const params = {
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    const result = await this.s3.upload(params).promise();
    return result.Location;
  }

  async uploadReceipt(file: Express.Multer.File, expenseId: string) {
    const key = `expenses/${expenseId}/${Date.now()}-${file.originalname}`;

    const params = {
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const result = await this.s3.upload(params).promise();
    return result.Location;
  }

  async deleteFile(url: string) {
    const key = url.split('/').pop();
    await this.s3.deleteObject({
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: key,
    }).promise();
  }
}
```

---

## Análisis (Google Analytics / Mixpanel)

```bash
npm install mixpanel
```

```typescript
// src/modules/integrations/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import { Mixpanel } from 'mixpanel';

@Injectable()
export class AnalyticsService {
  private mp: Mixpanel;

  constructor(private configService: ConfigService) {
    this.mp = Mixpanel.init(this.configService.get('MIXPANEL_TOKEN'));
  }

  async trackReservation(userId: string, reservation: Reservation) {
    this.mp.track(userId, 'Reservation Created', {
      propertyId: reservation.propertyId,
      totalPrice: reservation.totalPrice,
      nights: this.calculateNights(reservation.checkIn, reservation.checkOut),
    });
  }

  async trackExpense(userId: string, expense: Expense) {
    this.mp.track(userId, 'Expense Recorded', {
      category: expense.category,
      amount: expense.amount,
      propertyId: expense.propertyId,
    });
  }

  private calculateNights(checkIn: Date, checkOut: Date): number {
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  }
}
```

---

## Environment Variables Completo

```env
# Airbnb
AIRBNB_API_KEY=your-key
AIRBNB_API_SECRET=your-secret
AIRBNB_SYNC_INTERVAL=3600000

# Stripe
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid
SENDGRID_API_KEY=sg_...

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# AWS S3
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=apartamentos-bucket

# Analytics
MIXPANEL_TOKEN=mp-...

# General
APP_URL=https://app.example.com
WEBHOOK_URL=https://app.example.com/webhooks
```

---

**Última actualización:** Octubre 2025
