import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Task } from '../entities/Task';
import { User } from '../entities/User';
import { In } from 'typeorm';

export class TaskController {
  private taskRepository = AppDataSource.getRepository(Task);
  private userRepository = AppDataSource.getRepository(User);

  list = async (req: Request, res: Response) => {
    try {
      const {
        search,
        statuses,
        page = '1',
        limit = '10',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        myTasks,
      } = req.query as {
        search?: string;
        statuses?: string;
        page?: string;
        limit?: string;
        sortBy?: string;
        sortOrder?: string;
        myTasks?: string;
      };

      const pageNumber = Math.max(parseInt(page || '1', 10) || 1, 1);
      const pageSize = Math.min(Math.max(parseInt(limit || '10', 10) || 10, 1), 100);
      const skip = (pageNumber - 1) * pageSize;

      const qb = this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.owner', 'owner')
        .leftJoinAndSelect('task.assignees', 'assignee')
        .leftJoinAndSelect('task.attachments', 'attachments');

      if (search && search.trim()) {
        qb.andWhere('(LOWER(task.title) LIKE :search OR LOWER(task.description) LIKE :search)', {
          search: `%${search.toLowerCase()}%`,
        });
      }

      if (statuses) {
        const statusList = statuses
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        if (statusList.length) {
          qb.andWhere('task.status IN (:...statusList)', { statusList });
        }
      }

      if (myTasks === 'true' && req.user?.userId) {
        qb.andWhere('(owner.id = :userId OR assignee.id = :userId)', {
          userId: req.user.userId,
        });
      }

      // Sorting
      const allowedSortColumns = {
        createdAt: 'task.createdAt',
        title: 'task.title',
        status: 'task.status',
      } as const;

      const sortKey: keyof typeof allowedSortColumns =
        typeof sortBy === 'string' && sortBy in allowedSortColumns
          ? (sortBy as keyof typeof allowedSortColumns)
          : 'createdAt';
      const sortColumn = allowedSortColumns[sortKey];
      const order: 'ASC' | 'DESC' = sortOrder === 'asc' ? 'ASC' : 'DESC';
      qb.orderBy(sortColumn, order);

      qb.skip(skip).take(pageSize);

      const [items, total] = await qb.getManyAndCount();

      const totalPages = Math.ceil(total / pageSize) || 1;

      return res.json({
        items,
        total,
        page: pageNumber,
        pageSize,
        totalPages,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  };

  create = async (req: Request, res: Response) => {
    const { title, description, status = 'todo', assigneeIds = [] } = req.body;
    const ownerId = req.user?.userId;

    try {
      if (!ownerId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const owner = await this.userRepository.findOne({ where: { id: ownerId } });
      if (!owner) {
        return res.status(404).json({ message: 'Owner not found' });
      }

      const assignees = assigneeIds.length
        ? await this.userRepository.findBy({ id: In(assigneeIds) })
        : [];

      const task = this.taskRepository.create({
        title,
        description,
        status,
        owner,
        assignees,
      });

      const saved = await this.taskRepository.save(task);
      return res.status(201).json(saved);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create task' });
    }
  };

  update = async (req: Request, res: Response) => {
    const taskId = req.params.id;
    const { title, description, status, assigneeIds = [] } = req.body;

    try {
      if (!taskId) {
        return res.status(400).json({ message: 'Task id is required' });
      }

      const task = await this.taskRepository.findOne({ where: { id: taskId } });
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;
      if (assigneeIds) {
        task.assignees =
          assigneeIds && assigneeIds.length
            ? await this.userRepository.findBy({ id: In(assigneeIds) })
            : [];
      }

      const updated = await this.taskRepository.save(task);
      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update task' });
    }
  };

  remove = async (req: Request, res: Response) => {
    const taskId = req.params.id;

    try {
      if (!taskId) {
        return res.status(400).json({ message: 'Task id is required' });
      }

      const task = await this.taskRepository.findOne({ where: { id: taskId } });
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      await this.taskRepository.remove(task);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: 'Failed to delete task' });
    }
  };
}

