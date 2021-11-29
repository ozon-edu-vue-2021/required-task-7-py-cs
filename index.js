const listsElement = document.getElementById("lists");
const personElement = document.getElementById("person");

const FRIENDS = "friends";
const NOTFRIENDS = "notfriends";
const POPULARS = "populars";

let people;
let ids;

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
    const id = ids[idx];
    el.textContent = getNameById(id);
    el.dataset.id = id;
  });
};

const getPopulars = () => Object.entries(people)
    .sort((a, b) => b[1].friendedBy - a[1].friendedBy || a[1].name.localeCompare(b[1].name))
    .map(person => person[0]);

const changePerson = (id) => {
  if (!id) return;
  personElement.textContent = getNameById(id);
  const { friends, notfriends } = people[id]
  updateList(FRIENDS, friends);
  updateList(NOTFRIENDS, notfriends);
};

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

getData().then(processData).then(() => {
  updateList(POPULARS, getPopulars());
  changePerson(1);
  listsElement.onclick = (e) => changePerson(e.target.dataset.id);
});
