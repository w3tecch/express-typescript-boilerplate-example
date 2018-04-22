import { HttpError } from 'routing-controllers';

export class NotAllowedError extends HttpError {
    constructor() {
        super(403, 'You do not have the permission to do that!');
    }
}
