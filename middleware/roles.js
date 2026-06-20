function requireAdmin(
    req,
    res,
    next
){

    if(!req.session.user){
        return res
        .status(401)
        .json({
            message:"Login Required"
        });
    }

    if(
        req.session.user.role
        .toUpperCase() !== "ADMIN"
    ){
        return res
        .status(403)
        .json({
            message:"Admin Access Only"
        });
    }

    next();

}

function requireDesigner(
    req,
    res,
    next
){

    if(!req.session.user){
        return res
        .status(401)
        .json({
            message:"Login Required"
        });
    }

    if(
        req.session.user.role
        .toUpperCase() !== "DESIGNER"
    ){
        return res
        .status(403)
        .json({
            message:"Designer Access Only"
        });
    }

    next();

}

function requireApprover(
    req,
    res,
    next
){

    if(!req.session.user){
        return res
        .status(401)
        .json({
            message:"Login Required"
        });
    }

    if(
        req.session.user.role
        .toUpperCase() !== "APPROVER"
    ){
        return res
        .status(403)
        .json({
            message:"Approver Access Only"
        });
    }

    next();

}

function requireViewer(
    req,
    res,
    next
){

    if(!req.session.user){
        return res
        .status(401)
        .json({
            message:"Login Required"
        });
    }

    if(
        req.session.user.role
        .toUpperCase() !== "VIEWER"
    ){
        return res
        .status(403)
        .json({
            message:"Viewer Access Only"
        });
    }

    next();

}

module.exports = {
    requireAdmin,
    requireDesigner,
    requireApprover,
    requireViewer
};