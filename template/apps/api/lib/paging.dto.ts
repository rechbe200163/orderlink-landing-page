import { ApiProperty } from '@nestjs/swagger';

export class PagingDto {
  @ApiProperty()
  isFirstPage: boolean;

  @ApiProperty()
  isLastPage: boolean;

  @ApiProperty()
  currentPage: number;

  @ApiProperty({ nullable: true })
  previousPage: number | null;

  @ApiProperty({ nullable: true })
  nextPage: number | null;

  @ApiProperty()
  pageCount: number;

  @ApiProperty()
  totalCount: number;
}
