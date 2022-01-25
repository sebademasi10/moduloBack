import { Mutation, Query, Resolver, Arg, InputType, Field } from "type-graphql"
import { Author } from "../entity/author.entity";
import {getRepository,Repository} from "typeorm";


@InputType()
class AuthorInput {
    @Field()
    fullname!: string
}

@InputType()
class AuthorIdInput {
    @Field(()=>Number)
    id!: number
}


@InputType()
class AuthorUpdateInput {

    @Field(()=>Number)
    id!:number

    @Field()
    fullname?: string
}

@Resolver()
export class AuthorResolver {

    authorRepository:Repository <Author>

    constructor() {
        this.authorRepository= getRepository (Author)
    }

    @Mutation(() => Author)
    async createAuthor(
        @Arg("input", () => AuthorInput) input: AuthorInput
    ): Promise <Author| undefined> {

        try {
        const createdAuthor = await this.authorRepository.insert({fullname:input.fullname});
        const result = await this.authorRepository.findOne(createdAuthor.identifiers[0].id)
        return result;
        } catch {
            console.error
        }
    }

    @Query (()=>[Author])
    async getAllAuthors(): Promise <Author[]> {
        
        return await this.authorRepository.find();

    }

    @Query(()=>Author)
    async  getOneAuthor(

        @Arg("input", () => AuthorIdInput) input: AuthorIdInput
        ): Promise <Author | undefined> {
            
            try {
              const author= await this.authorRepository.findOne (input.id);  
              if (!author) {
                  const error = new Error ();
                  error.message="Author does not exist";
                  throw error;
              }
              return author
            }

            catch (e:any) {
                throw new Error (e);
            }
            
        }
    
    @Mutation(()=> Author)
    async updateOneAuthor(
        @Arg("input",()=>AuthorUpdateInput) input:AuthorUpdateInput
    ):Promise <Author | undefined> {

        const authorExists= await this.authorRepository.findOne(input.id);

        if (!authorExists){
            throw new Error ("Author does not exists")
        };

        // return await this.authorRepository.save({
        //     id:input.id,
        //     fullname: input.fullname
        // })

        const updatedAuthor= await this.authorRepository.save({
            id:input.id,
            fullname: input.fullname
        })

        return await this.authorRepository.findOne(updatedAuthor.id);
    }

    @Mutation(()=>Boolean)
    async deleteOneAuthor (
        @Arg("input", ()=> AuthorIdInput) input:AuthorIdInput):Promise<Boolean>
        {
            await this.authorRepository.delete(input.id);
            return true
        }


}