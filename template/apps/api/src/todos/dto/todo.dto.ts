import { ApiProperty } from "@nestjs/swagger";

export class TodoDto {
  @ApiProperty({
    type: "string",
  })
  id: string;
  @ApiProperty({
    type: "boolean",
  })
  completed: boolean;
  @ApiProperty({
    maximum: 255,
    type: "string",
  })
  description: string;
}
