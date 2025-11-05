import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    // Verificar si el usuario ya existe
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('El email ya está registrado');
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Crear usuario
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    await this.usersRepository.save(user);

    const { password: _password, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    // Buscar usuario por email
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload, {
      expiresIn: '24h',
    });

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _password, ...result } = user;
      return result;
    }

    return null;
  }
}
