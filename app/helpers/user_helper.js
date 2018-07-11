'use strict';
const User = db_sequelize.sequelize.models.user;
const uuid = require('uuid');
const fs = require('fs');
const main_attrs = ['id', 'login', 'log_token', 'lastEnter', 'username', 'email', 'avatar', 'push_enable', 'push_token', 'user_type', 'regionId', 'cnp_userid', 'cnp_token', 'app_version', 'language'];

module.exports.beautifyUser = function(user) {
    if (user) {
        if (!user.email) user.email = '';
        if (!user.username) user.username = '';
        if (user.avatar) user.avatar = `${appConfig.api_url}/${user.avatar}`;
        if (user.regionId) {
            let rn = allRegions.filter(x => {
              return parseInt(x.id, 10) === parseInt(user.regionId, 10);
            })[0];
            user.dataValues.regionName = rn ? rn.region_name : '';
        } else {
            user.dataValues.regionName = '';
        }
    }
    return user;
};

module.exports.updateUserParameters = (function(login, curr_user, user, image) {
    return new Promise((resolve, reject) => {
        user = appLodash(user).omitBy(appLodash.isUndefined).omitBy(appLodash.isNull).value();
        this.uploadAndSave(login, image)
        .then((image_name) => {
            if (image_name) user.avatar = image_name;
            return this.updateUser(
                { login: login },
                user
            );
        })
        .then(() => {
            return this.findUser(
                { login: login },
                main_attrs
            );
        })
        .then((user) => {
            resolve({ status: 'success', user: user });
        })
        .catch((error) => {
            reject(error);
        });
    });
});

module.exports.uploadAndSave = function(login, image) {
    return new Promise((resolve, reject) => {
        if (!image) resolve('');
        let shared_folder = `${appRoot}/storage/`;
        let file_name = `${uuid.v4()}.jpg`;
        fs.rename(image.path, `${shared_folder}${file_name}`, function(err) {
            if (err) {
                loggerHelper.error(err);
                resolve('');
            } else {
                resolve(file_name);
            }
        });
    });
};

module.exports.clear_token = function(login) {
  return new Promise((resolve, reject) => {
      this.updateUser(
          { login: login },
          { log_token: '' }
      )
      .then(() => {
          resolve();
      })
      .catch((error) => {
          reject(error);
      });
  });
};

module.exports.saveToken = function(login, token) {
  return new Promise((resolve, reject) => {
      let return_user = null;
      this.findCreateUser(login, { login: login }, main_attrs)
      .then(user => {
          return_user = user;
          return this.updateUser(
              { id: user.dataValues.id },
              { api_token: token }
          );
      })
      .then(() => {
          resolve(this.beautifyUser(return_user));
      })
      .catch(error => {
          reject(error);
      });
  });
};

module.exports.saveCnpToken = function(login, cnp_token) {
  return new Promise((resolve, reject) => {
      this.updateUser(
          { login: login },
          { cnp_token: cnp_token }
      )
      .then(() => {
          resolve();
      })
      .catch((error) => {
          reject(error);
      });
  });
};

module.exports.createUser = function(login) {
    return new Promise((resolve, reject) => {
        User.create({ login: login, ctn: login })
        .then(user => {
            resolve(user);
        })
        .catch(error => {
            reject(error);
        });
    });
};

module.exports.updateUser = function(update_user, update_obj) {
    return new Promise((resolve, reject) => {
        User.update(update_obj, {
            where: update_user
        })
        .then(() => {
            resolve();
        })
        .catch(error => {
            reject(error);
        });
    });
};

module.exports.generateLocalToken = function(login) {
    return new Promise((resolve, reject) => {
        let log_token = uuid.v4();
        this.updateUser(
            { login: login },
            { log_token: log_token }
        )
        .then(() => {
            return this.findUser(
                { login: login },
                main_attrs
            );
        })
        .then((user) => {
            resolve(user);
        })
        .catch((error) => {
            reject(error);
        });
    });
};

module.exports.findCreateUser = function(login, find_obj, attributes) {
    return new Promise((resolve, reject) => {
        this.findUser(find_obj, attributes)
        .then((user) => {
            if (!user) {
                return this.createUser(login);
            } else {
                resolve(user);
            }
        })
        .then((user) => {
            resolve(user);
        })
        .catch(error => {
            reject(error);
        });
    });
};

module.exports.findUser = function(find_obj, attributes) {
    return new Promise((resolve, reject) => {
        User.findOne({
            where: find_obj,
            attributes: attributes
        })
        .then((user) => {
            resolve(this.beautifyUser(user));
        })
        .catch(error => {
            reject(error);
        });
    });
};

module.exports.passedAuth = function(id) {
    this.updateUser(
        { id: id },
        { lastEnter: new Date() }
    )
    .then(() => {
    })
    .catch((error) => {
        loggerHelper.error(error);
    });
};

module.exports.signout = function(id) {
    this.updateUser(
        { id: id },
        { push_token: '' }
    )
    .then(() => {
    })
    .catch((error) => {
        loggerHelper.error(error);
    });
};
