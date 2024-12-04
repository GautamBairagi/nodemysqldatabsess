import { connection } from "../Config/dbConnect.js";

import bcrypt from 'bcrypt'

export const getallstaffs = async (req, res) => {
    try {
        const mysqlQuery = "SELECT * FROM staff";
        const [result] = await connection.query(mysqlQuery);
        if (result) {
            return res.status(200).json({ message: 'Users fetched successfully', data: result });
        }
        else {
            return res.result.status(404).json({ message: 'No data found' });
        }
    }
    catch (error) {
        return res.result.status(500).json({ message: "Internal server error", error: error.message });
    }
};
export const getstaff = async (req, res) => {
    try {
        const { id } = req.params
        const [result] = await connection.query("SELECT * FROM staff WHERE id=?", id)
        if (result) {
            return res.status(200).json({ message: "single Users fetched successfully", data: result })
        }
        else {
            return res.result.status(404).json({ message: "user not found" })
        }
    }
    catch (error) {
        return res.result.status(500).json({ message: "Internal server error", error: error.message });
    }
}

// export const createstaff = async (req, res) => {
//     try {
//         const { username, email, password } = req.body
//         const staffdata = {
//             username, email, password
//         }
//         const [result] = await connection.query("INSERT INTO staff SET ?", staffdata)
//         if (result) {
//             return res.status(200).json({ message: `${username} created sucessfully`, data: staffdata });
//         }
//         else {
//             return res.status(404).json({ message: "staff not created" });
//         }
//     }
//     catch (error) {
//         return res.result.status(500).json({ message: "internal server error", error: error.message });

//     }
// }


export const createstaff = async (req, res) => {
    try {
        const { username, email, password } = req.body

        const existingstaff = await connection.query("SELECT email FROM staff WHERE email=?", email)
        if(!existingstaff){
            return res.status(403).json("staff already exist")
        }
        else{
            const hashpassword = await bcrypt.hash(password, 10)
            const staffdata = {
                username, 
                email,
                password : hashpassword,
            }
            const [result] = await connection.query("INSERT INTO staff SET ?", staffdata)
            if (result) {
                return res.status(200).json({ message: `${username} created sucessfully`, data: staffdata });
            }
            else {
                return res.status(404).json({ message: "staff not created" });
            }
        }
    }
    catch (error) {
        return res.result.status(500).json({ message: "internal server error", error: error.message });

    }
}

export const updatestaff = async (req, res) => {
    try {
        const { username, email, password } = req.body
        const { id } = req.params
        const staffdata = {
            username, email, password
        }
        const [result] = await connection.query("UPDATE staff SET username=?, email=?, password=? WHERE id =?", [staffdata.username, staffdata.email, staffdata.password, id])
        const [getstaff] = await connection.query("SELECT * FROM staff WHERE id = ?", id)
        if (result) {
            return res.status(200).json({ message: `${username} Updated sucessfully`, data: getstaff })
        }
        else {
            return res.status(404).json({ message: "Staff not Updated" })
        }
    }
    catch (error) {
        return res.status(500).json({ error: error.message })
    }
}


export const deletestaff = async (req, res) => {
    try {

        const { id } = req.params

        const [result] = await connection.query("DELETE FROM staff WHERE id = ?", id)

        if (result) {
            return res.status(200).json({ message: `user deleted sucessfully` })
        }
        else {
            res.status(404).json({ message: "staff not found" })
        }
    }
    catch (error) {
        return res.status(500).json({ message: "internal server error", error: error.message });
    }

}