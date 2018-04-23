import { IsNotEmpty } from 'class-validator';

export class NewTask {

    @IsNotEmpty()
    public title: string;

}
