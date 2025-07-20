export interface ImploParty2025 {
    timestamps:  Timestamp[];
    shopping:    Shopping;
    packingList: PackingList[];
    form:        Form;
}

export interface Form {
    name:      string;
    lunch:     string;
    dinner:    string;
    shopping:  string;
    overnight: string;
}

export interface PackingList {
    title: string;
    icon:  string;
}

export interface Shopping {
    date:     string;
    time:     string;
    location: string;
}

export interface Timestamp {
    title:    string;
    time:     string;
    date:     string;
    location: string;
    icon:     string;
    extra?:   string;
}
