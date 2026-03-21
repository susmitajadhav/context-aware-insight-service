import { AppError } from './AppError.js';

export class AIServiceError extends AppError {
  constructor(message = 'AI Service Failed') {
    super(message, 502);
  }
}