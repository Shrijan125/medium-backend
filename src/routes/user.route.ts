import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { signUpInput,signinInput } from "@shrijan2123/zodvalidation/dist";

export const userRotuer=new Hono<{
	Bindings: {
		DATABASE_URL: string
        JWT_SECRET:string
	}
}>();

userRotuer.post('/signup', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();

	const {success}=signUpInput.safeParse(body);
    if(!success)
    {
        c.status(400);
        return c.json({ error: "invalid input" });
    }

	try {
		const user = await prisma.user.create({
			data: {
				email: body.email,
				password: body.password,
				username: body.username
			}
		});
		const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
		return c.json({ jwt });
	} catch(e) {
		c.status(403);
		return c.json({ error: "error while signing up" });
	}
});


userRotuer.post('/signin',async(c)=>{
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
	const body=await c.req.json();

	const {success}=signinInput.safeParse(body);
    if(!success)
    {
        c.status(400);
        return c.json({ error: "invalid input" });
    }

	try {
		const userExists=await prisma.user.findFirst({
			where:{username:body.username ,
				password:body.password,
			},
		})
		if(!userExists)
			{
				c.status(403);
				return c.json({error:"User not found"});
			}
		const jwt= await sign({id:userExists.id},c.env.JWT_SECRET);
		c.status(200);
		return c.json({jwt});
	} catch (error) {
		c.status(400);
		return c.json({error:"Something went wrong"});
	}
});

