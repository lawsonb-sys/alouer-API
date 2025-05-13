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
      // Log du path
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

    if (file) {
      console.log('File object during update:', file);
      if (user.profile) {
        const filnam = user.profile.split('/').pop()!;
        const oldpath = join(process.cwd(), 'uploads/profile', filnam);
        try {
          await fsPromises.unlink(oldpath);
        } catch (error: any) {
          if (error.code === 'ENOENT') {
            console.warn(
              `L'ancien fichier de profil "${oldpath}" n'a pas été trouvé et ne pouvait pas être supprimé. Ceci n'empêche pas la mise à jour.`,
            );
          } else {
            console.error('Erreur lors de la suppression du fichier:', error);
            throw new Error('Erreur lors de la suppression du fichier ');
          }
        }
      }
      console.log('ServeStatic rootPath:', join(__dirname, '..', 'uploads'));

      user.profile = `${process.env.BASE_URL}/uploads/profile/${file.filename}`;
      console.log('voici le path ', user.profile);
    }

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
