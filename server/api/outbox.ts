export default defineEventHandler(() => {
	return {
		"@context": "https://www.w3.org/ns/activitystreams",
		type: "OrderedCollection",
		totalItems: 1,
		orderedItems: [
			{
				type: "Create",
				actor: "https://myodyssey.org/actors/odysseus",
				object: {
					type: "Note",
					content: "Odysseus vertrekt uit Troje."
				}
			}
		]
	};
});
