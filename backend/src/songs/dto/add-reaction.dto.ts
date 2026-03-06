import { IsString, IsNotEmpty, IsEnum } from "class-validator";
import { ReactionType } from "src/reaction/enums/reaction-type.enum";


export class AddReactionDto
{
    @IsNotEmpty()
    songId: number;

    @IsNotEmpty()
    @IsEnum(ReactionType, { message: 'Reaction must be one of: like, love, angry' })
    type: ReactionType;

}
