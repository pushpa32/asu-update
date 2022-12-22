import Jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    let token = ''
    if (!req.cookies.access_token) {
        token = req.body.tokens
    }
    else {
        token = req.cookies.access_token
    }

    if (!token) throw new Error("You are not authenticated!")

    Jwt.verify(token, process.env.JWT_KEY, (err, user) => {
        if (err) throw new Error("Token is not valid!")
        req.user = user
        next()
    })
}

export const verifyUser = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.user.isUser || req.user.user.isAdmin || req.user.user.isSuperAdmin) {
            next();
        } else {
            return next("You are not authorized!");
        }
    });
};

export const verifyHR = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.user.isAdmin || req.user.user.isSuperAdmin || req.user.isHR) next()
        else throw new Error("Not authenticated!")
    })

}

export const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        console.log(req.user.user);
        if (req.user.user.isAdmin || req.user.user.isSuperAdmin) next()
        else throw new Error("Not authenticated!")
    })

}

export const verifySuperAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.user.isSuperAdmin) next()
        else throw new Error("Not authenticated!")
    })

}

