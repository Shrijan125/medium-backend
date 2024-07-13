import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import {createPostInput, updatePostInput} from "@shrijan2123/zodvalidation/dist";

export const postRouter=new Hono<{
	Bindings: {
		DATABASE_URL: string
        JWT_SECRET:string
	}
}>();

postRouter.post("/",async(c)=>{
    const prisma=new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

    const userId=c.get('jwtPayload');
    const body= await c.req.json();
    const {success}=createPostInput.safeParse(body);
    if(!success)
    {
        c.status(400);
        return c.json({ error: "invalid input" });
    }
    const newPost= await prisma.post.create({data:{
        title:body.title,
        content:body.content,
        authorId:userId
    }})
    
    if(newPost)
    {
        c.status(200);
        return c.json({id:newPost.id});
    }
   
    c.status(403);
    return c.json({error:"Falied to create post"});
});

postRouter.put("/updateblog",async(c)=>{
    const prisma=new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
    
    const userId=c.get('jwtPayload');
    const body= await c.req.json();

    const {success}=updatePostInput.safeParse(body);
    if(!success)
    {
        c.status(400);
        return c.json({ error: "invalid input" });
    }

    const updatePost= await prisma.post.update({where:{
        id:body.id,
        authorId:userId
    },data:{
        title:body.title,
        content:body.content
    }});

    if(updatePost)
    {
        c.status(200);
        return c.json({id:updatePost.id});
    }

    c.status(403);
    return c.json({error:"Falied to update post"});
});

postRouter.get("/all",async(c)=>{
    const prisma=new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

    const posts=await prisma.post.findMany({
        select:{
            content:true,
            title:true,
            id:true,
            author:{
                select:{
                    username:true
                }
            }
        }
    });
    c.status(200);
    return c.json(posts); 
});

postRouter.get("/:id",async(c)=>{
    const prisma=new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
    const id=c.req.param('id');

    const post=await prisma.post.findUnique({
        where:{
            id:Number(id)
        },
        select:{
            content:true,
            title:true,
            id:true,
            author:{
                select:{
                    username:true
                }
            }
        }
    })
    c.status(200);
    return c.json(post);
});

