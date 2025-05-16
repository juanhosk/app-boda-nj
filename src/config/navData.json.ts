export interface navLinkItem {
	text: string;
	link: string;
	newTab?: boolean; // adds target="_blank" rel="noopener noreferrer" to link
}

export interface navDropdownItem {
	text: string;
	dropdown: navLinkItem[];
}

export type navItem = navLinkItem | navDropdownItem;

// note: 1 level of dropdown is supported
const navConfig: navItem[] = [
	{
		text: "Inicio",
		link: "/",
	},
	{
		text: "Horario",
		link: "/portfolio",
	},
	{
		text: "Lugar",
		link: "/#pricing",
	}
];

export default navConfig;
