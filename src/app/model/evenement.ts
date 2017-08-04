import * as moment from 'moment';

export class Evenement {
	id: number;

	debut: any;
	fin: any;

	info: string;
	type: any;
	url: string;

	bgcouleur: string;
	couleur: string;

	static readonly DEFC = [
		{
			type: "Vie de la filière",
			couleur: "#000",
			bgcouleur: "#91FF5A"
		},
		{
			type: "Examens",
			couleur: "#000",
			bgcouleur: "#E8A94E"
		},
		{
			type: "Devoirs à rendre",
			couleur: "#000",
			bgcouleur: "#FF6269"
		},
		{
			type: "Vie étudiante",
			couleur: "#000",
			bgcouleur: "#894EE8"
		},
		{
			type: "Autres",
			couleur: "#000",
			bgcouleur: "#62D5FF"
		}
	];

	static readonly DEFAUT = {
		couleur: "#000",
		bgcouleur: "#FFFFFF"
	};

	constructor(e?) {
		if (e) {
			this.init(e);
		} else {
			this.init({
				id: 0,
				debut: moment().format(),
				fin: "",
				info: "",
				type: "",
				url: ""
			});
		}
	}

	init(e): void {
		this.id = e.id;

		this.debut = moment(e.debut);
		if (e.fin && e.fin != "") {
			this.fin = moment(e.fin);
		} else {
			this.fin = "";
		}

		this.info = e.info;
		this.type = e.type;
		this.url = e.url || "";

		this.initCouleur();
	}

	getDebut(): string {
		return this.debut.format('YYYY-MM-DD HH:mm:ss');
	}

	getFin(): string {
		if (this.fin) {
			return this.fin.format('YYYY-MM-DD HH:mm:ss');
		} else {
			return "";
		}
	}

	getInfo(): string {
		return this.info;
	}

	getType(): string {
		return this.type;
	}

	getUrl(): string {
		return this.url;
	}

	setType(str): void {
		this.type = str;

		this.initCouleur();
	}

	setInfo(str): void {
		this.info = str;
	}

	setUrl(str): void {
		this.url = str;
	}

	setDebut(year, month, day, hour, minute): void {
		this.debut = moment([year, month-1, day, hour, minute]);
	}

	setFin(year, month, day, hour, minute): void {
		this.fin = moment([year, month-1, day, hour, minute]);
	}

	initCouleur(): void {
		for (let c of Evenement.DEFC) {
			if (c.type === this.type) {
				this.couleur = c.couleur;
				this.bgcouleur = c.bgcouleur;
				break;
			}
		}

		if (!this.couleur && !this.couleur) {
			this.couleur = Evenement.DEFAUT.couleur;
			this.bgcouleur = Evenement.DEFAUT.bgcouleur;
		}
	}
}