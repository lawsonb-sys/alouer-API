import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { createStorage } from 'src/storage';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('post')
  @ApiOperation({ summary: 'Créer un utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @UseInterceptors(
    FileInterceptor('profile', {
      storage: createStorage('profile', 'profile'),
    }),
  )
  create(@Body() user: User, @UploadedFile() profile: Express.Multer.File) {
    try {
      return this.usersService.create(user, profile);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new ConflictException(error.message);
    }
  }

  @Get('get')
  @ApiOperation({ summary: 'Recuperer tous les utilisateurs' })
  @ApiResponse({
    status: 201,
    description: 'Tous les utilisateurs recuperer avec succes',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Recuperer un utilisateur' })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur recuperer avec succes',
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Modifier un utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur modifier avec succes' })
  @UseInterceptors(
    FileInterceptor('profile', {
      storage: createStorage('profile', 'profile'),
    }),
  )
  update(
    @Param('id') id: number,
    @Body() updateUserDto: User,
    @UploadedFile() profile: Express.Multer.File,
  ) {
    return this.usersService.update(+id, updateUserDto, profile);
  }

  @Delete('delet/:id')
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur supprimer avec succes',
  })
  async remove(@Param('id') id: string) {
    await this.usersService.remove(+id);
    return `Utilisateur  ${id}  suprimer surprimer avec succes}}`;
  }

  @Post('login')
  @ApiOperation({ summary: 'Connexion d un utilisateur' })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur connecter avec succes',
  })
  async login(@Body() loginDto: User): Promise<User> {
    console.log('login', loginDto);
    try {
      return await this.usersService.login(loginDto.nom, loginDto.password);
    } catch (e) {
      throw new UnauthorizedException(
        `Echec de la connexion,verifier le nom ou le mot de passe ,${e}`,
      );
    }
  }
}
