import { connection } from "../Config/dbConnect.js"

export const getallUsers = async (req, res) => {
    try {
        const mysqlQuery = "SELECT * FROM users";
        const [result] = await connection.query(mysqlQuery);
        if (result) {
            return res.status(200).json({ message: "Users fetched successfully", data: result });
        } else {
            return res.status(404).json({ message: "No data found" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const getuser = (async (req, res) => {
    try {
        const { id } = req.params
        const [result] = await connection.query("SELECT * from users WHERE id =?", id)
        result ? res.status(200).json({ message: "single user fetch sucessfully", data: result }) : "user not found"
    } catch (error) {
        return res.status(500).json(error.message)
    }
})

export const createuser = (async (req, res) => {
    try {
        const { username, email, password } = req.body
        const userData = {
            username,
            email,
            password,

        }
        const [result] = await connection.query("INSERT INTO users SET ?", userData)
        result ? res.status(200).json({
            message: `${username} created sucessfully`,
            data: userData
        }) : "User not created"
    } catch (error) {
        return res.status(500).json(error.message)
    }
})

export const updateuser = (async (req, res) => {
    try {
        const { id } = req.params
        const { username, email, password } = req.body

        const [result] = await connection.query("UPDATE users SET  username= ? , email = ? , password=? WHERE id = ?", [username, email, password, id])

        const [getUser] = await connection.query("SELECT * FROM users WHERE id =?", id)

        result ? res.status(200).json({ message: `${username} Updated sucessfully`, data: getUser }) : "User not Updated"
    } catch (error) {
        return res.status(500).json(error.message)
    }
})

export const deleteuser = (async (req, res) => {
    try {
        const { id } = req.params
        const [result] = await connection.query("DELETE from users WHERE id =?", id)
        result ? res.status(200).json({ message: `user deleted sucessfully` }) : "user not found"
    } catch (error) {
        return res.status(500).json(error.message)
    }
})


