var dataRepository = {
    all: [{
            id: 1,
            name: 'John Doe',
            imageUrl: 'johndoe.jpg',
            position: 'Founder',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac augue at erat hendrerit dictum. Praesent porta, purus eget sagittis imperdiet, nulla mi ullamcorper metus, id hendrerit metus diam vitae est. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.'
        }, {
            id: 2,
            name: 'Jane Helf',
            imageUrl: 'janehelf.jpg',
            position: 'Creative Director',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac augue at erat hendrerit dictum. Praesent porta, purus eget sagittis imperdiet, nulla mi ullamcorper metus, id hendrerit metus diam vitae est. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.'
        }, {
            id: 3,
            name: 'Joshua Insanus',
            imageUrl: 'joshuainsanus.jpg',
            position: 'Lead Designer',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac augue at erat hendrerit dictum. Praesent porta, purus eget sagittis imperdiet, nulla mi ullamcorper metus, id hendrerit metus diam vitae est. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.'
        }
    ],
    getAll: function () {
        return this.all;
    },
    getById: function(id){        
        for(var i=0;i<this.all.length;i++){
            if(this.all[i].id === id){
                return this.all[i];
            }
        }
    }
};