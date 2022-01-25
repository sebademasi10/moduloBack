import { Mutation, Query, Resolver, Arg, InputType, Field, UseMiddleware } from "type-graphql"
import { Book } from "../entity/book.entity";
import {Author} from "../entity/author.entity"
import { getRepository, Repository } from "typeorm";
//import { IContext, isAuth } from '../middlewares/auth.middleware';


@InputType()

@InputType()
class AuthorInput {
    @Field()
    fullname!: string
}

class BookInput {
    @Field()
    title!: string

    @Field()
    author!: number;
}

@Resolver()
export class BookResolver {

    bookRepository: Repository<Book>
    authorRepository: Repository <Author>

    constructor() {
        this.bookRepository = getRepository(Book)
        this.authorRepository= getRepository(Author);
        
    }



    @Mutation(() => Book)
    async createAuthor(
        @Arg("input", () => BookInput) input: BookInput) {
        try {
            const author: Author| undefined = await this.authorRepository.findOne(input.author);
            
            if (!author) {
                const error = new Error();
                error.message="The author for this book does not exist, please double check"
                throw error;
            }

            const book= await this.bookRepository.insert ({title:input.title, author:author});

         return await this.bookRepository.findOne(book.identifiers[0].id, {relations: ["author", "author.books"]})
           

        }catch (e:any) {
            throw new Error (e.message)
        }
    }


}