import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Comment } from '../entities/Comment';
import { Task } from '../entities/Task';
import { User } from '../entities/User';

export class CommentController {
  private commentRepository = AppDataSource.getRepository(Comment);
  private taskRepository = AppDataSource.getRepository(Task);
  private userRepository = AppDataSource.getRepository(User);

  list = async (req: Request, res: Response) => {
    try {
      const taskId = req.params.taskId;
      if (!taskId) {
        return res.status(400).json({ message: 'Task ID is required' });
      }

      const comments = await this.commentRepository.find({
        where: { task: { id: taskId } },
        relations: ['author', 'task'],
        order: { createdAt: 'ASC' },
      });

      return res.json(comments);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch comments' });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const taskId = req.params.taskId;
      const { content } = req.body;
      const authorId = req.user?.userId;

      if (!taskId) {
        return res.status(400).json({ message: 'Task ID is required' });
      }

      if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Comment content is required' });
      }

      if (!authorId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const task = await this.taskRepository.findOne({ where: { id: taskId } });
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const author = await this.userRepository.findOne({ where: { id: authorId } });
      if (!author) {
        return res.status(404).json({ message: 'User not found' });
      }

      const comment = this.commentRepository.create({
        content: content.trim(),
        task,
        author,
      });

      const saved = await this.commentRepository.save(comment);
      const commentWithRelations = await this.commentRepository.findOne({
        where: { id: saved.id },
        relations: ['author', 'task'],
      });

      return res.status(201).json(commentWithRelations);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create comment' });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const commentId = req.params.id;
      const { content } = req.body;
      const userId = req.user?.userId;

      if (!commentId) {
        return res.status(400).json({ message: 'Comment ID is required' });
      }

      if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Comment content is required' });
      }

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const comment = await this.commentRepository.findOne({
        where: { id: commentId },
        relations: ['author'],
      });

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      if (comment.author.id !== userId) {
        return res.status(403).json({ message: 'You can only edit your own comments' });
      }

      comment.content = content.trim();
      const updated = await this.commentRepository.save(comment);
      const commentWithRelations = await this.commentRepository.findOne({
        where: { id: updated.id },
        relations: ['author', 'task'],
      });

      return res.json(commentWithRelations);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update comment' });
    }
  };

  remove = async (req: Request, res: Response) => {
    try {
      const commentId = req.params.id;
      const userId = req.user?.userId;

      if (!commentId) {
        return res.status(400).json({ message: 'Comment ID is required' });
      }

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const comment = await this.commentRepository.findOne({
        where: { id: commentId },
        relations: ['author'],
      });

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      if (comment.author.id !== userId) {
        return res.status(403).json({ message: 'You can only delete your own comments' });
      }

      await this.commentRepository.remove(comment);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: 'Failed to delete comment' });
    }
  };
}





