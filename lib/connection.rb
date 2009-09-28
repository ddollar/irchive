require 'set'

require 'anise'
require 'couchrest'
require 'facets/array/only'
require 'facets/enumerable/mash'
require 'facets/string/words'

require 'autumn/misc'
require 'autumn/daemon'
require 'autumn/stem_facade'
require 'autumn/stem'

class Connection < Autumn::Stem

  def initialize(*args)
    super
    load_daemon_info
    update_designs
  end

  def database
    @database ||= CouchRest.database!('http://127.0.0.1:5984/irchive')
  end

  def muted
    true
  end

  def load_daemon_info
    Dir.glob(File.join(File.dirname(__FILE__), 'resources/daemons/*.yml')).each do |yml_file|
      yml = YAML.load(File.open(yml_file, 'r'))
      Autumn::Daemon.new File.basename(yml_file, '.yml'), yml
    end
  end

  def respond(*args)
    puts "RESPOND[#{args.first}]#{args[1..-1].inspect}"
    method = args.shift
    if self.respond_to? method
      #puts "CALLING #{method} WITH ARGS[#{args.inspect}]"
      self.send(method, *args)
    end
  end

  def irc_invite_event(stem, sender, arguments)
    join(arguments[:channel])
  end

  def irc_event(stem, type, sender, arguments)
    return if type == :ping

    document          = arguments
    document[:type]   = type.to_s
    document[:sender] = sender
    document[:date]   = Time.now

    if (document[:recipient] || '')[0..0] == '#'
      document[:channel] ||= document[:recipient]
    end

    document[:recipient] = (document[:recipient] || '').downcase
    document[:channel]  = (document[:channel]   || '').downcase

    document[:message].gsub!(/[^\w\d\!\@\#\$\%\^\&\*\(\)\-\_\=\+\[\{\]\}\;\:\'\"\,\<\.\>\/\? ]/, '')

    database.save_doc(document)
  end

  # def irc_mode_event(stem, sender, arguments)
  #   document          = arguments
  #   document[:type]   = 'mode'
  #   document[:sender] = sender
  #   document[:date]   = Time.now
  #
  #   database.save_doc(document)
  # end
  #
  # def irc_privmsg_event(stem, sender, arguments)
  #   document          = arguments
  #   document[:type]   = 'privmsg'
  #   document[:sender] = sender
  #   document[:date]   = Time.now
  #
  #   database.save_doc(document)
  # end

## database ##################################################################

  def document_ids
    database.documents['rows'].map { |row| row['id']}
  end

  def register_design(name, design)
    view = "_design/#{name}"
    database.delete_doc(database.get(view)) if document_ids.include?(view)
    database.save_doc(design.merge('_id' => view))
  end

  def update_designs
    designs = {}

    Dir.chdir(File.join(File.dirname(__FILE__), 'resources', 'designs')) do
      Dir['**/*.js'].each do |design_file|
        design, design_type, name, algorithm_type = design_file.gsub(/\.js$/, '').split('/')
        designs[design] ||= {}
        designs[design][design_type] ||= {}
        designs[design][design_type][name] ||= {}
        designs[design][design_type][name][algorithm_type] = File.read(design_file)
      end
    end

    designs.each do |name, design|
      register_design name, design
    end
  end

end
