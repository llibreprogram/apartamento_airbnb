import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto, FilterExpenseDto } from './dto/create-expense.dto';
import { ExpenseCategory } from './entities/expense.entity';

@ApiTags('Expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({ status: 201, description: 'Expense created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.create(createExpenseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'List of expenses' })
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.expensesService.findAll(parseInt(page), parseInt(limit));
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Get expenses for a specific property' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'isPaid', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of expenses for property' })
  findByProperty(
    @Param('propertyId') propertyId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('category') category?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('isPaid') isPaid?: string,
  ) {
    const filters: FilterExpenseDto = {};
    if (category) filters.category = category as ExpenseCategory;
    
    // Parse ISO date strings - extract YYYY-MM-DD part only, parse as UTC
    if (startDate) {
      try {
        // Extract the date portion from ISO string (e.g., "2025-11-01" from "2025-11-01T00:00:00.000Z")
        const datePart = startDate.split('T')[0]; // "2025-11-01"
        const [year, month, day] = datePart.split('-').map(Number);
        // Create date in UTC timezone
        filters.startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        console.log('Parsed startDate:', { input: startDate, parsed: filters.startDate, iso: filters.startDate.toISOString() });
      } catch (e) {
        console.warn('Invalid startDate format:', startDate);
      }
    }
    
    if (endDate) {
      try {
        // Extract the date portion from ISO string
        const datePart = endDate.split('T')[0]; // "2025-11-01"
        const [year, month, day] = datePart.split('-').map(Number);
        // Create date in UTC timezone, set to end of day
        filters.endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
        console.log('Parsed endDate:', { input: endDate, parsed: filters.endDate, iso: filters.endDate.toISOString() });
      } catch (e) {
        console.warn('Invalid endDate format:', endDate);
      }
    }
    
    if (isPaid) filters.isPaid = isPaid === 'true';

    console.log('Fetching expenses with filters:', { propertyId, filters, page, limit });
    const result = this.expensesService.findByProperty(
      propertyId,
      parseInt(page),
      parseInt(limit),
      filters,
    );
    
    return result;
  }

  @Get('property/:propertyId/category/:category')
  @ApiOperation({ summary: 'Get expenses for a property by category' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'List of expenses by category' })
  findByCategory(
    @Param('propertyId') propertyId: string,
    @Param('category') category: ExpenseCategory,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.expensesService.findByCategory(
      propertyId,
      category,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get('property/:propertyId/date-range')
  @ApiOperation({ summary: 'Get expenses for a property by date range' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'List of expenses in date range' })
  findByDateRange(
    @Param('propertyId') propertyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.expensesService.findByDateRange(
      propertyId,
      new Date(startDate),
      new Date(endDate),
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get('property/:propertyId/total-by-category')
  @ApiOperation({ summary: 'Get total expenses by category for a property' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Total expenses by category' })
  getTotalByCategory(
    @Param('propertyId') propertyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.expensesService.getTotalByCategory(
      propertyId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('property/:propertyId/total')
  @ApiOperation({ summary: 'Get total expenses for a property' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Total expenses amount' })
  getTotalExpenses(
    @Param('propertyId') propertyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.expensesService.getTotalExpenses(
      propertyId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense by ID' })
  @ApiResponse({ status: 200, description: 'Expense details' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an expense' })
  @ApiResponse({ status: 200, description: 'Expense updated' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Post(':id/mark-as-paid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark expense as paid' })
  @ApiResponse({ status: 200, description: 'Expense marked as paid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  markAsPaid(@Param('id') id: string) {
    return this.expensesService.markAsPaid(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiResponse({ status: 200, description: 'Expense deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
