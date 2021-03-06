set :application, "irchive"
set :deploy_to,   "/srv/app/#{application}"
set :deploy_via,  :remote_cache
set :repository,  "git@peervoice.com:ruby/irchive.git"
set :scm,         :git
set :user,        "david"

default_run_options[:pty]   = true
ssh_options[:forward_agent] = true

set :normalize_asset_timestamps, false

role :app, "peervoice.com"
role :db,  "peervoice.com"
role :irc, "peervoice.com"

# no idea why cap doesn't do this
after 'deploy:setup' do
  sudo %{ chown -R #{user} #{deploy_to} }
end

# symlink config files out of shared/config
after 'deploy:update_code' do
  run %{
    for FILE in $(ls #{shared_path}/config); do
      ln -sf #{shared_path}/config/$(basename $FILE) #{release_path}/config/$(basename $FILE);
    done
  }
end

namespace :deploy do
  task :gems do
    sudo 'gem install anise builder couchrest facets memcache-client rack-cache sinatra'
  end
end

namespace :deploy do
  task :start do; end
  task :stop  do; end

  task :restart, :roles => :app do
    run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
  end

  task :restart_bot, :roles => :irc do
    sudo "stop irchive"
    sudo "start irchive"
  end
end
