import Header from "./Header/Header";

function AppLayout({ children }) {
    return (
    <>
        <Header />
        <main>{children}</main>
    </>
    );
}

export default AppLayout;