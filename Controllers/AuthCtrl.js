import { connection } from "../Config/dbConnect.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import { generatetoken } from "../Config/jwt.js";

// 1. simple Get All Users
// export const getallUsers = async (req, res) => {
//     try {
//         const mysqlQuery = "SELECT * FROM users";
//         const [result] = await connection.query(mysqlQuery);
//         if (result) {
//             return res.status(200).json({ message: "Users fetched successfully", data: result });
//         } else {
//             return res.status(404).json({ message: "No data found" });
//         }
//     } catch (error) {
//         return res.status(500).json({ message: "Internal server error", error: error.message });
//     }
// };

// 1. advanced  Get All Users is_active  , subscription_expiry , login_attempts 
export const getallUsers = async (req, res) => {
    try {
        const mysqlQuery = `
            SELECT u.*, u.is_active, u.subscription_expiry, COUNT(l.id) AS login_attempts FROM users u LEFT JOIN login_attempts
             l ON u.id = l.user_id GROUP BY  u.id `;
        const [result] = await connection.query(mysqlQuery);
        if (result.length > 0) {
            return res.status(200).json({ message: "Users fetched successfully", data: result });
        } else {
            return res.status(404).json({ message: "No data found" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};



// 2. Get User by ID
export const getuser = (async (req, res) => {
    try {
        const { id } = req.params
        const [result] = await connection.query("SELECT * from users WHERE id =?", id)
        result ? res.status(200).json({ message: "single user fetch sucessfully", data: result }) : "user not found"
    } catch (error) {
        return res.status(500).json(error.message)
    }
})

// 3. Get User by Username
export const getuserbyusername = (async (req, res) => {
    try {
        const { username } = req.params
        console.log("username", username);
        const [result] = await connection.query("SELECT * from users WHERE username = ?", username)
        result ? res.status(200).json({ message: "single user fetch sucessfully", data: result }) : "user not found"
    } catch (error) {
        return res.status(500).json(error.message)
    }
})

// 4. Get Users by Username 'a'
export const getUsersByUsernameA = async (req, res) => {
    try {
        const mysqlQuery = "SELECT * FROM users WHERE username = ?";
        const [result] = await connection.query(mysqlQuery, ["a"]);
        if (result.length > 0) {
            return res.status(200).json({
                message: "Users with username 'a' fetched successfully",
                // count: result.length, // Include the count here
                data: result
            });
        } else {
            return res.status(404).json({ message: "No users found with username 'a'" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// 5. Create User
export const createuser = (async (req, res) => {
    try {
        const { username, email, password, is_active = 1, subscription_expiry = null } = req.body
        const existinguser = await connection.query("SELECT email FROM users WHERE email=?", email)
        if (!existinguser) {
            return res.status(403).json("User already exist")
        }
        else {
            const hashpassword = await bcrypt.hash(password, 10)
            const userData = {
                username,
                email,
                password: hashpassword,
                is_active,
                subscription_expiry,

            }
            const [result] = await connection.query("INSERT INTO users SET ?", userData)
            result ? res.status(200).json({
                message: `${username} created sucessfully`,
                data: userData
            }) : "User not created"

        }

    } catch (error) {
        return res.status(500).json(error.message)
    }
})

// 6. simple User Login
// export const userlogins = async (req, res) => { 
//     try {
//         const { email, password } = req.body
//         const [existinguser] = await connection.query("SELECT * FROM users WHERE email=?", [email])
//         if (!existinguser) {
//             res.status(403).json("User not found")
//         }
//         const user= existinguser[0]
//         const comprepassword = await bcrypt.compare(password, user.password)
//         if(!comprepassword)
//         {
//            return res.status(403).json("Password is incorrect")

//         }
//         const token =await generatetoken(user.id)
//         console.log(token);

//             return res.status(201).json({ 
//                 message: "Login Successfully",
//                  data:{
//                    username :user.username,
//                    email:user.email,
//                    token
//                 }
//                 })
//     }
//      catch (error) {
//         return res.status(500).json({ message: "Internal server error", error: error.message });
//     }
// };




// 6. advanced  User Login
export const userlogins = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [existinguser] = await connection.query("SELECT * FROM users WHERE email=?", [email]);

        if (existinguser.length === 0) {
            await logLoginAttempt(null, 0); // Passing `null` for `user_id` if user doesn't exist
            return res.status(403).json("User not found");
        }

        const user = existinguser[0];
        const comparePassword = await bcrypt.compare(password, user.password);
        if (!comparePassword) {
            // Log failed login attempt (wrong password)
            await logLoginAttempt(user.id, 0);
            return res.status(403).json("Password is incorrect");
        }
        // last_login
        await connection.query("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);

        const token = await generatetoken(user.id);
      
        // Log successful login attempt
        await logLoginAttempt(user.id, 1);

           // User logged activty
        await logUserActivity(user.id, "User logged in successfully");

        return res.status(201).json({
            message: "Login Successfully",
            data: {
                username: user.username,
                email: user.email,
                token,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Helper function to log login attempts
const logLoginAttempt = async (userId, success) => {
    try {
        await connection.query(
            "INSERT INTO login_attempts (user_id, success) VALUES (?, ?)",
            [userId, success]
        );
    } catch (error) {
        console.error("Error logging login attempt:", error.message);
    }
};


// 7. Update User
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

// 8. Delete User
export const deleteuser = (async (req, res) => {
    try {
        const { id } = req.params
        const [result] = await connection.query("DELETE from users WHERE id =?", id)
        result ? res.status(200).json({ message: `user deleted sucessfully` }) : "user not found"
    } catch (error) {
        return res.status(500).json(error.message)
    }
})

// 9. Count Total Number of Users
export const countUsers = async (req, res) => {
    try {
        const [result] = await connection.query("SELECT COUNT(*) as total FROM users");
        return res.status(200).json({ message: "Total users count", data: result });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// 10. Select Users with Pagination   
// get http://localhost:3000/api/v1/userp/pagination?limit=3&offset=0
export const getUsersWithPagination = async (req, res) => {
    try {
        const { limit, offset } = req.query;
        const mysqlQuery = "SELECT * FROM users LIMIT ? OFFSET ?";
        const [result] = await connection.query(mysqlQuery, [parseInt(limit), parseInt(offset)]);
        if (result.length > 0) {
            return res.status(200).json({ message: "Users fetched with pagination", data: result });
        } else {
            return res.status(404).json({ message: "No users found" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};




// 11. Select Users with Sorting
// get   http://localhost:3000/api/v1/usersorting/sorting?sort=asc
// http://localhost:3000/api/v1/usersorting/sorting?sort=desc

export const getUsersWithSorting = async (req, res) => {
    try {
        const { sort } = req.query; // asc or desc
        const mysqlQuery = `SELECT * FROM users ORDER BY username ${sort}`;
        const [result] = await connection.query(mysqlQuery);
        return res.status(200).json({ message: "Users fetched with sorting", data: result });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// 12.
// error
export const getUsersNotLoggedInSince = async (req, res) => {
    try {
        const { lastLoginDate } = req.query;
        const mysqlQuery = "SELECT * FROM users WHERE last_login < ?";
        const [result] = await connection.query(mysqlQuery, [lastLoginDate]);
        return res.status(200).json({ message: "Users not logged in since date", data: result });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// 13.  
export  const logUserActivity = async (userId, activityDescription) => {
    try {
        // Insert the activity into the user_activity table
        await connection.query(
            "INSERT INTO user_activity (user_id, activity_description) VALUES (?, ?)",
            [userId, activityDescription]
        );
    } catch (error) {
        console.error("Error logging user activity:", error.message);
    }
};


// 14. Select Users by InActive Status
export const getInactiveActiveUsers = async (req, res) => {
    try {
        const mysqlQuery = "SELECT * FROM users WHERE is_active = ?";
        const [result] = await connection.query(mysqlQuery, [0]);
        return res.status(200).json({ message: "Active users fetched successfully", data: result });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};



// 14. Select Users by Active Status
export const getActiveUsers = async (req, res) => {
    try {
        const mysqlQuery = "SELECT * FROM users WHERE is_active = ?";
        const [result] = await connection.query(mysqlQuery, [1]);
        return res.status(200).json({ message: "Active users fetched successfully", data: result });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};




