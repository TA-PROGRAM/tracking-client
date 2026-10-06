import db from "../mock/db";

// Builds the menu from users_permiss / users_subpermiss like the legacy header.php
const accessMenu = ({ PERMISSIONS }) => {
  const menuItems = (PERMISSIONS || [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((m) => {
      const subs = db
        .findSync("users_subpermiss", { m_id: m.id, flag: 1 })
        .sort((a, b) => a.order - b.order)
        .map((s) => ({ name: s.title, icon: s.icon, to: s.page ? `${m.url}/${s.page}` : m.url }));
      return { name: m.name, icon: m.icon, to: m.url, module: m.module, children: subs.length ? subs : null };
    });
  return { menuItems };
};

export default accessMenu;
