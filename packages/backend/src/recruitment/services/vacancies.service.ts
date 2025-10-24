import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vacancy, VacancyStatus } from '../entities/vacancy.entity';
import { CreateVacancyDto } from '../dto/create-vacancy.dto';
import { UpdateVacancyDto } from '../dto/update-vacancy.dto';

@Injectable()
export class VacanciesService {
  constructor(
    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,
  ) {}

  async create(createVacancyDto: CreateVacancyDto, userId: string): Promise<Vacancy> {
    const vacancy = this.vacancyRepository.create({
      ...createVacancyDto,
      creadorId: userId,
    });

    return await this.vacancyRepository.save(vacancy);
  }

  async findAll(): Promise<Vacancy[]> {
    return await this.vacancyRepository.find({
      relations: ['creador', 'candidates'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Vacancy> {
    const vacancy = await this.vacancyRepository.findOne({
      where: { id },
      relations: ['creador', 'candidates'],
    });

    if (!vacancy) {
      throw new NotFoundException(`Vacante con ID ${id} no encontrada`);
    }

    return vacancy;
  }

  async update(id: string, updateVacancyDto: UpdateVacancyDto): Promise<Vacancy> {
    const vacancy = await this.findOne(id);

    Object.assign(vacancy, updateVacancyDto);

    return await this.vacancyRepository.save(vacancy);
  }

  async remove(id: string): Promise<void> {
    const vacancy = await this.findOne(id);
    await this.vacancyRepository.remove(vacancy);
  }

  async findByStatus(estado: VacancyStatus): Promise<Vacancy[]> {
    return await this.vacancyRepository.find({
      where: { estado },
      relations: ['creador', 'candidates'],
      order: { createdAt: 'DESC' },
    });
  }
}
