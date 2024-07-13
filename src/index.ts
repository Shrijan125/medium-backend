import { Hono } from 'hono'
import { userRotuer } from './routes/user.route';
import { postRouter } from './routes/post.route';
import {  verify } from 'hono/jwt';
import { cors } from 'hono/cors';


const app = new Hono<{
	Bindings: {
		DATABASE_URL: string;
        JWT_SECRET:string;
	},
}>();

app.use('/*', cors());

app.get('/', (c) => {
  return c.text('Healthy!')
})

app.use('/api/v1/blog/*',async(c,next)=>{
  const token=c.req.header('Authorization')||"";
  // const jwt=token.split(' ')[1];
  try {
    const user=await verify(token,c.env.JWT_SECRET);
     if(user)
    { 
      c.set('jwtPayload',user.id);
      await next();
    }
      else{
        c.status(401);
        return c.json({error:"You are not authorised"});
      }
  } catch (error) {
    c.status(401);
    return c.json({error:"You are not authorised"});
  }

    
});

app.route("/api/v1/user",userRotuer);
app.route("/api/v1/blog",postRouter);


export default app
