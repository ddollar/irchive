$:.unshift(File.join(File.dirname(__FILE__), '../lib'))

require 'rubygems'
require 'connection'

config = YAML::load_file(File.join(File.dirname(__FILE__), '..', 'config', 'irchive.yml'))

stem = Connection.new('chat.us.freenode.net',
  config['nick'],
  :channels => config['channels'],
  :password => config['password'],
  :logger   => Logger.new(STDOUT)
)

stem.start
