const { createContext, useState } = require("react");


export const usercontext = createContext({});

function UserContextProvider ({ children }) {

    const [userInfo, setUserInfo] = useState({});

    return (
        <usercontext.Provider value={{userInfo, setUserInfo}} >
            {children}
        </usercontext.Provider>
        )
}

export default UserContextProvider;