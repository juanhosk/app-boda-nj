export interface SiteDataProps {
	name: String;
	title: string;
	description: string;
	useViewTransitions?: boolean; // defaults to false. Set to true to enable some Astro 3.0 view transitions
	author: {
		name: string;
		email: string;
		twitter: string; // used for twitter cards when sharing a blog post on twitter
	};
	defaultImage: {
		src: string;
		alt: string;
	};
}

// Update this file with your site specific information
const siteData: SiteDataProps = {
	name: "Boda Noelia y Juanjo",
	// Your website's title and description (meta fields)
	title: "Boda de Noelia y Juanjo",
	description:
		"Pagina web para la boda de Noelia y Juanjo",
	useViewTransitions: true,
	// Your information!
	author: {
		name: "Juan José Castro Escobar",
		email: "smrjuanjomovil@gmail.com",
		twitter: "juanhosk",
	},

	// default image for meta tags if the page doesn't have an image already
	defaultImage: {
		src: "/images/rings.png",
		alt: "Boda Noelia y Juanjo",
	},
};

export default siteData;
