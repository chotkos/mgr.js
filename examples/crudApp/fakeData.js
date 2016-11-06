var dataRepository = {
    all: [{
            id: 1,
            name: 'John Doe',
            imageUrl: '_include/img/profile/profile-01.jpg',
            position: 'Founder',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac augue at erat hendrerit dictum. Praesent porta, purus eget sagittis imperdiet, nulla mi ullamcorper metus, id hendrerit metus diam vitae est. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.'
        }, {
            id: 2,
            name: 'Jane Helf',
            imageUrl: '_include/img/profile/profile-02.jpg',
            position: 'Creative Director',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac augue at erat hendrerit dictum. Praesent porta, purus eget sagittis imperdiet, nulla mi ullamcorper metus, id hendrerit metus diam vitae est. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.'
        }, {
            id: 3,
            name: 'Joshua Insanus',
            imageUrl: '_include/img/profile/profile-03.jpg',
            position: 'Lead Designer',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac augue at erat hendrerit dictum. Praesent porta, purus eget sagittis imperdiet, nulla mi ullamcorper metus, id hendrerit metus diam vitae est. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.'
        }
    ],
    getAll: function () {
        return this.all;
    },
    getById: function (id) {
        for (var i = 0; i < this.all.length; i++) {
            if (this.all[i].id === id) {
                return this.all[i];
            }
        }
    },
    create: function (model) {
        var id = parseInt(Math.random() * 100000000);
        model.id = id;
        dataRepository.all.push(model);
    },
    update: function (model) {
        for (var i = 0; i < this.all.length; i++) {
            if (this.all[i].id === model.id) {
                this.all[i] = model;
            }
        }
    },
    remove: function (id) {
        var index = -1;
        for (var i = 0; i < this.all.length; i++) {
            if (this.all[i].id === id) {
                index = i;
                break;
            }
        }
        if (index != -1) {
            this.all.splice(index, 1);
        }
    },
};
