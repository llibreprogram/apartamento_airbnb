import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ReservationsService } from './reservations.service';
import {
  CreateReservationDto,
  UpdateReservationDto,
  CancelReservationDto,
  CompleteReservationDto,
  RegisterElectricityCostDto,
} from './dto/create-reservation.dto';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post('calculate-price')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Calculate total price for dates without creating reservation' })
  @ApiResponse({ status: 200, description: 'Price calculated' })
  @ApiResponse({ status: 400, description: 'Invalid dates' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async calculatePrice(@Body() body: { propertyId: string; checkIn: string; checkOut: string }) {
    const totalPrice = await this.reservationsService.calculateTotalPrice(
      body.propertyId,
      new Date(body.checkIn),
      new Date(body.checkOut),
    );
    return { totalPrice };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new reservation' })
  @ApiResponse({ status: 201, description: 'Reservation created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid dates or property unavailable' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createReservationDto: CreateReservationDto, @Req() req: any) {
    return this.reservationsService.create(req.user.id, createReservationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reservations (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'List of reservations' })
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.reservationsService.findAll(parseInt(page), parseInt(limit));
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Get reservations for a specific property' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'List of reservations for property' })
  findByProperty(
    @Param('propertyId') propertyId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.reservationsService.findByProperty(
      propertyId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get('my-reservations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my reservations as guest' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'List of user reservations' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findMyReservations(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Req() req: any,
  ) {
    return this.reservationsService.findByGuest(
      req.user.id,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get('available/:propertyId')
  @ApiOperation({ summary: 'Check availability for dates' })
  @ApiQuery({ name: 'checkIn', required: true, type: String, description: 'ISO date' })
  @ApiQuery({ name: 'checkOut', required: true, type: String, description: 'ISO date' })
  @ApiResponse({ status: 200, description: 'Availability status' })
  checkAvailability(
    @Param('propertyId') propertyId: string,
    @Query('checkIn') checkIn: string,
    @Query('checkOut') checkOut: string,
  ) {
    return this.reservationsService.findAvailable(
      propertyId,
      new Date(checkIn),
      new Date(checkOut),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reservation by ID' })
  @ApiResponse({ status: 200, description: 'Reservation details' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a reservation' })
  @ApiResponse({ status: 200, description: 'Reservation updated' })
  @ApiResponse({ status: 400, description: 'Invalid operation' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
    @Req() req: any,
  ) {
    return this.reservationsService.update(id, req.user.id, updateReservationDto);
  }

  @Post(':id/confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm a pending reservation (Admin)' })
  @ApiResponse({ status: 200, description: 'Reservation confirmed' })
  @ApiResponse({ status: 400, description: 'Cannot confirm reservation' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  confirm(@Param('id') id: string) {
    return this.reservationsService.confirm(id);
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark reservation as completed with optional electricity data (Admin)' })
  @ApiResponse({ status: 200, description: 'Reservation completed' })
  @ApiResponse({ status: 400, description: 'Cannot complete reservation' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  complete(
    @Param('id') id: string,
    @Body() completeDto?: CompleteReservationDto,
  ) {
    return this.reservationsService.complete(id, completeDto);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a reservation' })
  @ApiResponse({ status: 200, description: 'Reservation cancelled' })
  @ApiResponse({ status: 400, description: 'Cannot cancel reservation' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  cancel(
    @Param('id') id: string,
    @Body() cancelReservationDto: CancelReservationDto,
    @Req() req: any,
  ) {
    return this.reservationsService.cancel(id, req.user.id, cancelReservationDto);
  }

  @Post(':id/register-electricity-cost')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register the actual electricity cost paid by owner (Admin)' })
  @ApiResponse({ status: 200, description: 'Electricity cost registered' })
  @ApiResponse({ status: 400, description: 'Invalid data or reservation not completed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  registerElectricityCost(
    @Param('id') id: string,
    @Body() dto: RegisterElectricityCostDto,
  ) {
    return this.reservationsService.registerElectricityCost(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a reservation' })
  @ApiResponse({ status: 200, description: 'Reservation deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }
}
