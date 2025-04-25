import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { promises as fsPromises } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { PasswordUtils } from './password.utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async create(user: User, profile: Express.Multer.File): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { nom: user.nom },
    });

    if (existingUser) {
      throw new ConflictException(`Cette utilisateur  ${user.nom} existe déjà`);
    }

    if (profile) {
      user.profile = `${process.env.BASE_URL}/uploads/profile/${profile.filename}`;
      // Log après vérification
    } else {
      console.log('users: profile is undefined'); // Log si profile est undefined
    }
    user.password = await PasswordUtils.hashPassword(user.password);
    return this.userRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error("Pas d'utilisateur avec cet id)");
    }

    return user;
  }

  async update(
    id: number,
    updateUser: User,
    file: Express.Multer.File,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new Error(`Pas d'utilisateur avec cet id ${id}`);
    }

    if (updateUser.password) {
      updateUser.password = await PasswordUtils.hashPassword(
        updateUser.password,
      );
    }
    if (file && user.profile) {
      const filnam = user.profile.split('/').pop()!;
      const oldpath = join(process.cwd(), 'uploads/profile', filnam);
      try {
        await fsPromises.unlink(oldpath);
      } catch (error) {
        throw new Error('Erreur lors de la suppression du fichier ');
      }
    }
    user.profile = `${process.env.BASE_URL}/uploads/profile/${file.filename}`;
    Object.assign(user, updateUser);

    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async login(nom: string, password: string): Promise<User> {
    console.log('logins', { nom, password });
    const user = await this.userRepository.findOne({ where: { nom } });
    if (!user) {
      throw new Error("Cet utilisateur n'existe pas");
    }
    const isPasswordValid = await PasswordUtils.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new Error('Mot de passe incorrect');
    }

    return user;
  }
}
