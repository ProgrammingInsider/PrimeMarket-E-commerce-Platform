import { useState } from "react";
import { FaBars } from "react-icons/fa";
import Logo from "../common/Logo";
import Menu from "../common/Menu";
import styles from "../../assets/styles/components/Header.module.css";

const Header = () => {
  const [menu, showMenu] = useState(false);

  return (
    <>
      <header className={styles.Header}>
        <div className={styles.Logo}>
          <Logo />
        </div>

        <Menu menu={menu} showMenu={showMenu} />

        <FaBars
          className={styles.bars}
          onClick={() => showMenu(!menu)}
          data-testid="showMenu"
        />
      </header>
    </>
  );
};

export default Header;
