const containerElement = document.getElementById("container");
const backToListElement = document.querySelector(".back");
const listViewElement = document.querySelector(".contacts-list");
const detailsViewElement = document.querySelector(".details-view");
const contactTemplateElement = document.querySelector(".contact-template");

const FRIENDS = "friends";
const NOTFRIENDS = "notfriends";
const POPULARS = "populars";

let people;
let ids;
let userElement;

const lists = [FRIENDS, NOTFRIENDS, POPULARS].reduce((acc, list) => {
  return {
    ...acc,
    [list]: document.getElementsByClassName(list)
  }
}, {});

const getNameById = (id) => people[id].name;

const updateList = (listType, ids) => {
  const list = lists[listType];
  [...list].forEach((el, idx) => {
    el.textContent = getNameById(ids[idx]);
  });
};

const getPopulars = () => Object.entries(people)
    .sort((a, b) => b[1].friendedBy - a[1].friendedBy || a[1].name.localeCompare(b[1].name))
    .map(person => person[0]);

const processData = (data) => {
  ids = data.map(person => person.id);
  people = data.reduce((acc, { id, name, friends }) => {
    if (!acc[id]) acc[id] = {};
    acc[id].name = name;
    acc[id].friends = friends;
    acc[id].notfriends = new Set(ids);
    acc[id].notfriends.delete(id);
    friends.forEach(friend => {
      if (!acc[friend]) {
        acc[friend] = {}
      }
      acc[id].notfriends.delete(friend);
      acc[friend].friendedBy = (acc[friend].friendedBy || 0) + 1;
    });
    acc[id].notfriends = [...acc[id].notfriends]
    return acc
  }, {});
};

const getData = async () => {
  return fetch('data.json').then(res => res.json());
};

const showDetailsView = () => {
  containerElement.classList.add("details");
}

const showListView = () => {
  containerElement.classList.remove("details");
  userElement.classList.remove("selected");
}

const populateContacts = () => {
  Object.keys(people).forEach(personId => {
    const contactNode = document.createElement("li");
    contactNode.textContent = people[personId].name;
    contactNode.dataset.id = personId;
    listViewElement.append(contactNode)
  })
}

handleUserSelect = e => {
  const { id } = e.target.dataset;
  if (!id) return;
  userElement = e.target.closest("li");
  userElement.classList.add("selected");
  showDetailsView();
  const { friends, notfriends } = people[id]
  updateList(FRIENDS, friends);
  updateList(NOTFRIENDS, notfriends);
};

getData().then(processData).then(() => {
  populateContacts();
  updateList(POPULARS, getPopulars());
  listViewElement.onclick = handleUserSelect;
  backToListElement.onclick = showListView;
});
