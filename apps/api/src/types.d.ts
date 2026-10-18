import { ITenant } from './auth/decorators/tenant.decorator';

declare global {
  namespace Express {
    interface Request {
      user?: ITenant;
    }
  }
}
