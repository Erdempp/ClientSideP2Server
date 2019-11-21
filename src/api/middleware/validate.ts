import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

export default function validate(req: Request, res: Response) {
    console.log('hit');
    console.log(req.body);
    res.status(200).json({ ok: 'ok '});

    // const verification = jwt.verify(req.headers.Authorization, 'randomSecret');
    // if (!verification) {
        // failed
    // }

    // good;
}
